const io = $IO.of('/chat');
const { getRoomIds, joinChatRoom, getRoomName } = require('./lib/func');
const roomHandler = require('./handlers/roomHandler');
const chatHandler = require('./handlers/chatHandler');
const userHandler = require('./handlers/userHandler');

io.use((socket, next) => {
	const userId = socket.handshake.auth.userId;
	if (!userId) {
		return next(new Error("invalid userId"));
	}
	socket.userId = userId;
	next();
});

io.on("connection", async (socket) => {
	// 핸들러 등록
	roomHandler(io, socket);
	chatHandler(io, socket);
	userHandler(io, socket);

	console.log(socket.userId, socket.id);
	// fetch existing users

	await $DB.user.update({ connected: true }, { where: { id: socket.userId } })

	socket.join(socket.userId); // 아이디로 방에 입장
	// 내가 입장할 방 목록 가져오고 방에 입장
	const roomIds = await getRoomIds(socket.userId);
	console.log('roomIds', roomIds);
	// 방 목록을 반환 <-
	const rooms = [];
	for (const roomId of roomIds) {
		const room = await joinChatRoom(socket, roomId);
		// 방 목록에 내가 접속했음을 알린다.
		const roomName = getRoomName(roomId);
		socket.to(roomName).emit('room:connect', roomId, socket.userId, true);
		rooms.push(room);
	}
	// console.log('rooms', rooms);
	socket.emit('room:init', rooms); // 접속 했을때 룸목록 주잖아
	
	// notify users upon disconnection
	socket.on("disconnect", async () => {
		const matchingSockets = await io.in(socket.userId).allSockets();
		const isDisconnected = matchingSockets.size == 0;
		if (isDisconnected) {
			await $DB.user.update({ connected: false }, { where: { id: socket.userId } });
			console.log("disconnect", socket.userId);
			// 내가 입장한 방의 사용자들에게 내가 연결이 종료됬음을 알림
			const roomIds = await getRoomIds(socket.userId);
			for(const roomId of roomIds) {
				const roomName = getRoomName(roomId);
				socket.to(roomName).emit('room:connect', roomId, socket.userId, false);
			}
		}
	});
});