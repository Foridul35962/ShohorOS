import { Server } from "socket.io";

export const socketHandler = (io: Server): void => {
    io.on("connection", (socket) => {
        socket.on("joinUser", ({ userId }: { userId: string }): void => {
            socket.join(`user:${userId}`);
        });
    });
};