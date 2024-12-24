import React from "react";
import Sidebar from "./SideBar";
import Chat from "./ChatDetails";

const ChatRoom = () => {
  return (
    <div className="font-sans bg-gray-100 h-screen flex">
      <Chat />
    </div>
  );
};

export default ChatRoom;
