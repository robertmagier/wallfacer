import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server } from 'socket.io';
@WebSocketGateway({
  cors: {
    origin: '*', // Adjust this for security in production
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class TransactionsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('WebSocket Initialized');
  }

  handleConnection(client: any) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Method to emit updates
  notifyClients(event: string, data: any) {
    try {
      this.server.emit(event, data);
    } catch(e) {
      console.error('Error notifying clients:', e);
    }
  }
}
