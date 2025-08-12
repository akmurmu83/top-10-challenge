import { generateTop10List } from '../services/openai.js';

// In-memory storage for rooms (in production, use Redis or database)
const rooms = new Map();

const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`👤 User connected: ${socket.id}`);

    // Create a new room
    socket.on('createRoom', async (data) => {
      try {
        const { playerName, category } = data;
        const roomId = generateRoomId();

        console.log(`🏠 Creating room ${roomId} for category: ${category}`);

        // Generate top 10 list
        const items = await generateTop10List(category);
        const topItems = items.map((name, index) => ({
          rank: index + 1,
          name,
          isRevealed: false,
          guessedBy: null
        }));

        // Create room
        const room = {
          id: roomId,
          category,
          topItems,
          players: [{
            id: socket.id,
            name: playerName,
            score: 0,
            isAdmin: true
          }],
          currentPlayerIndex: 0,
          gameStatus: 'lobby', // lobby, playing, finished
          createdAt: new Date()
        };

        rooms.set(roomId, room);
        socket.join(roomId);
        socket.roomId = roomId;

        socket.emit('roomCreated', {
          roomId,
          room: {
            ...room,
            topItems: room.topItems.map(item => ({ ...item, name: '***' })) // Hide names
          }
        });

        console.log(`✅ Room ${roomId} created successfully`);
      } catch (error) {
        console.error('Error creating room:', error);
        socket.emit('error', { message: 'Failed to create room' });
      }
    });

    // Join existing room
    socket.on('joinRoom', (data) => {
      const { playerName, roomId } = data;
      const room = rooms.get(roomId);

      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      if (room.gameStatus === 'playing') {
        socket.emit('error', { message: 'Game already in progress' });
        return;
      }

      // Check if player name already exists
      if (room.players.some(p => p.name.toLowerCase() === playerName.toLowerCase())) {
        socket.emit('error', { message: 'Player name already taken' });
        return;
      }

      // Add player to room
      room.players.push({
        id: socket.id,
        name: playerName,
        score: 0,
        isAdmin: false
      });

      socket.join(roomId);
      socket.roomId = roomId;

      // Notify all players in room
      io.to(roomId).emit('playerJoined', {
        player: { name: playerName },
        room: {
          ...room,
          topItems: room.topItems.map(item => ({ ...item, name: '***' }))
        }
      });

      console.log(`👥 ${playerName} joined room ${roomId}`);
    });

    // Start game (admin only)
    socket.on('startGame', () => {
      const roomId = socket.roomId;
      const room = rooms.get(roomId);

      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      const player = room.players.find(p => p.id === socket.id);
      if (!player || !player.isAdmin) {
        socket.emit('error', { message: 'Only admin can start the game' });
        return;
      }

      room.gameStatus = 'playing';
      room.currentPlayerIndex = 0;

      const currentPlayer = room.players[room.currentPlayerIndex];

      io.to(roomId).emit('gameStarted', {
        room: {
          ...room,
          topItems: room.topItems.map(item => ({
            rank: item.rank,
            name: '***',
            isRevealed: item.isRevealed,
            guessedBy: item.guessedBy
          }))
        },
        currentPlayer: currentPlayer
      });

      console.log(`🎮 Game started in room ${roomId}`);
      console.log(`👤 First player: ${currentPlayer.name} (${currentPlayer.id})`);
    });

    // Submit guess
    socket.on('submitGuess', (data) => {
      const { guess } = data;
      const roomId = socket.roomId;
      const room = rooms.get(roomId);

      if (!room || room.gameStatus !== 'playing') {
        socket.emit('error', { message: 'Invalid game state' });
        return;
      }

      const currentPlayer = room.players[room.currentPlayerIndex];
      if (currentPlayer.id !== socket.id) {
        socket.emit('error', { message: 'Not your turn' });
        return;
      }

      // Check if guess matches any unrevealed item
      const itemIndex = room.topItems.findIndex(
        item => !item.isRevealed &&
          item.name.toLowerCase().includes(guess.toLowerCase())
      );

      if (itemIndex !== -1) {
        // Correct guess
        const item = room.topItems[itemIndex];
        item.isRevealed = true;
        item.guessedBy = currentPlayer.name;

        // Award points (rank 1 = 10 points, rank 10 = 1 point)
        const points = 11 - item.rank;
        currentPlayer.score += points;

        // Check if game is complete
        const revealedCount = room.topItems.filter(item => item.isRevealed).length;
        if (revealedCount === 10) {
          room.gameStatus = 'finished';
        }

        io.to(roomId).emit('correctGuess', {
          item: {
            rank: item.rank,
            name: item.name,
            isRevealed: true,
            guessedBy: item.guessedBy
          },
          player: currentPlayer,
          gameStatus: room.gameStatus,
          allItems: room.gameStatus === 'finished' ? room.topItems : undefined
        });

        console.log(`✅ Correct guess in room ${roomId}: ${guess} by ${currentPlayer.name}`);
      } else {
        // Wrong guess
        socket.emit('wrongGuess', { guess });
        console.log(`❌ Wrong guess in room ${roomId}: ${guess} by ${currentPlayer.name}`);
      }

      // Move to next player (regardless of correct/wrong)
      if (room.gameStatus === 'playing') {
        room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;
        const nextPlayer = room.players[room.currentPlayerIndex];
        console.log(`🔄 Next turn: ${nextPlayer.name} (${nextPlayer.id})`);
        io.to(roomId).emit('nextTurn', {
          currentPlayerIndex: room.currentPlayerIndex,
          currentPlayer: nextPlayer,
          currentTurnPlayer: nextPlayer
        });
      }
    });

    // End game (admin only)
    socket.on('endGame', () => {
      const roomId = socket.roomId;
      const room = rooms.get(roomId);

      if (!room) return;

      const player = room.players.find(p => p.id === socket.id);
      if (!player || !player.isAdmin) {
        socket.emit('error', { message: 'Only admin can end the game' });
        return;
      }

      room.gameStatus = 'finished';

      io.to(roomId).emit('gameEnded', {
        room: {
          ...room,
          topItems: room.topItems // Reveal all items
        }
      });

      console.log(`🏁 Game ended in room ${roomId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`👋 User disconnected: ${socket.id}`);

      const roomId = socket.roomId;
      if (roomId) {
        const room = rooms.get(roomId);
        if (room) {
          // Remove player from room
          room.players = room.players.filter(p => p.id !== socket.id);

          // If room is empty, delete it
          if (room.players.length === 0) {
            rooms.delete(roomId);
            console.log(`🗑️ Room ${roomId} deleted (empty)`);
          } else {
            // If admin left, make first player admin
            if (!room.players.some(p => p.isAdmin)) {
              room.players[0].isAdmin = true;
            }

            // Notify remaining players
            io.to(roomId).emit('playerLeft', {
              room: {
                ...room,
                topItems: room.topItems.map(item => ({
                  rank: item.rank,
                  name: room.gameStatus === 'finished' ? item.name : '***',
                  isRevealed: item.isRevealed,
                  guessedBy: item.guessedBy
                }))
              }
            });
          }
        }
      }
    });
  });

  // Log room statistics periodically
  setInterval(() => {
    console.log(`📊 Active rooms: ${rooms.size}`);
  }, 60000); // Every minute
};