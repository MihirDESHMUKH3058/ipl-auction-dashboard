export class SocketService {
  constructor(io) {
    this.io = io;
    this.auctionNamespace = io.of('/auction');
    this.setupHandlers();
  }

  setupHandlers() {
    this.auctionNamespace.on('connection', (socket) => {
      console.log(`Socket ${socket.id} connected to /auction`);

      socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
      });

      socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} disconnected`);
      });
    });
  }

  broadcastBid(bid) {
    this.auctionNamespace.emit('bid:new', bid);
  }

  broadcastStatus(status) {
    this.auctionNamespace.emit('auction:status', status);
  }

  broadcastTimer(seconds) {
    this.auctionNamespace.emit('timer:tick', { seconds });
  }

  broadcastSold(data) {
    this.auctionNamespace.emit('player:sold', data);
  }
}
