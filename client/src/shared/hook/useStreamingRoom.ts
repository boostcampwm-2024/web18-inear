import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSocketEvents } from './useSocketEvents';
import { io } from 'socket.io-client';

const URL = '/rooms';
export function useStreamingRoom() {
  const [isConnected, setIsConnected] = useState(false);
  const { roomId } = useParams();

  const socket = io(URL, {
    autoConnect: false,
    query: {
      roomId: roomId,
    },
  });

  const handleDisconnect = () => {
    setIsConnected(false);
  };

  const handleJoinRoom = (data: any) => {
    console.log('방 입장 : ', data);
  };

  const handleConnectError = (err: Error) => {
    setIsConnected(false);
    console.log(`연결 오류 : ${err.message}`);
  };

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  useSocketEvents({
    socket,
    events: {
      // connect: handleConnect,
      disconnect: handleDisconnect,
      connect_error: handleConnectError,
      joinedRoom: handleJoinRoom,
    },
  });

  return { isConnected };
}
