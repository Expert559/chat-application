"use client";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import Chat from "@/utils/interfaces/chat";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

import { ArrowLeftIcon, LogOutIcon, UserIcon } from "lucide-react";
import { useUser } from "@/app/context/UserProvider";

import { IoMdExit, IoMdMore } from "react-icons/io";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import UserCard from "./cards/UserCard";
import DropdownMenuComponent from "./shared/DropDownComponent";
import {
  cn,
  deepClone,
  getCurrentUser,
  getOtherUser,
  isCurrentUserSender,
  truncateString,
} from "@/lib/utils";

import Link from "next/link";
import { Message } from "@/utils/interfaces/message";
import MessageService from "@/services/messageService";
import { toast } from "sonner";
import Profile from "./Profile";
import ChatService from "@/services/chatService";
import { useSocket } from "@/app/context/SocketProvider";
import UserService from "@/services/userServices";
import MessageForm from "./forms/MessageForm";
import MessagesList from "./MessageList";
import FileInput from "./forms/FileInput";
interface ChatProps {
  readonly chatDetails: Chat;
  readonly messagesData: Message[];
}

// const userS = new UserService(localStorage.getItem("token") as string);
const ChatDetails: React.FC<ChatProps> = ({
  chatDetails,
  messagesData,
}: ChatProps) => {
  const { logout, Chat, setChats, Chats, getAuthCookie } = useUser();
  const [RenameText, setRenameText] = useState<string | "">(
    chatDetails.isGroupChat ? chatDetails.chatName : ""
  );
  const [toggleFilesModal, setToggleFilesModal] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [MessageText, setMessageText] = useState("");
  const [Messages, setMessages] = useState<Message[] | []>(
    messagesData as Message[]
  );

  const [files, setFiles] = useState<File[]>([]);
  const [previewFiles, setPreviewFiles] = useState<string[]>([]);
  const [IsLoading, setIsLoading] = useState(false);
  const [OnlineUsers, setOnlineUsers] = useState({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { socket } = useSocket();
  const currentChatId = chatDetails._id || "";

  // scroll to bottom
  const scrollToBottom = () => {
    if (containerRef.current)
      containerRef.current?.scrollTo(0, containerRef.current.scrollHeight);
  };

  // play sound on sending
  const playSound = async () => {
    if (audioRef.current) {
      await audioRef.current.play();
    }
  };

  useEffect(() => {
    console.log(chatDetails, messagesData);
    scrollToBottom();
  }, [Messages, chatDetails, messagesData]);

  useEffect(() => {
    const currentUser = getCurrentUser()?.user;
  }, [Chat, chatDetails]);

  useEffect(() => {
    const currentUser = getCurrentUser()?.user;

    console.log(currentUser, " user-");
    socket?.on("messageReceived", (data) => {
      const newMessage = deepClone(data?.message);
      playSound();

      setMessages((_) => [..._, newMessage]);
    });

    socket?.on("onlineUsers", (onlineUsers) => {
      console.log(onlineUsers, " online");

      setOnlineUsers(onlineUsers);
    });

    socket?.emit("joinChatRoom", chatDetails);

    return () => {
      // socket?.close();
      socket?.off("messageReceived");
      socket?.off("onlineUsers");
    };
  }, [Chat, chatDetails, socket]);

  const chatService = new ChatService(getAuthCookie());
  const handleSendMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!MessageText) {
      toast.error("Please enter a message");
      return;
    }
    const currentUser = getCurrentUser()?.user;
    if (!currentUser) {
      // * Show Toast For temporing the logged-in userdata in the localstorage
      return;
    }

    const messageService = new MessageService(getAuthCookie());
    // TODo! have to "handle multiple files with video" (currently) handled one-image file, also optimize the "server"
    let firstFile = files[0];
    let fileUrl = "";
    if (firstFile) {
      fileUrl = URL.createObjectURL(firstFile);
      // fileUrl = fileUrl.substring(5);
      // Use fileUrl
    } else {
      console.error("File not found.");
    }
    console.log(fileUrl, "files");
    let message: Message = {
      content: MessageText,
      sender: currentUser,
      chat: chatDetails as Chat,
      media: [{
        url: fileUrl, 
        mediaType: "image",
        _id: ""
      }],
    };

    setMessages((previousMessages: Message[]) => [
      ...previousMessages,
      message,
    ]);
    setMessageText("");
    console.log(files);
    messageService
      .createMessage(chatDetails?._id, MessageText, files)
      .then((_) => {
        socket?.emit("newMessage", {
          message,
          chat: chatDetails as Chat,
        });
        console.log("message sent successfuly");
        // toast.success("Message sent successfully");
      })
      .catch((err: unknown) => {
        console.log("error occured while sending message", err);
        toast.error("Failed to send message");
      });

    setToggleFilesModal(false);
  };

  const isOtherOnline = Object.keys(OnlineUsers).includes(
    getOtherUser(chatDetails.users)?.email || ""
  );
  return (
    <div className="flex-grow p-4 ">
      <audio ref={audioRef} src="/sound.mp3" />
      <div className="flex flex-col h-full">
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40">
          <div className="flex gap-4">
            <Link href={"/chat"}>
              <Button className=" rounded-full">
                <ArrowLeftIcon size={20} />
              </Button>
            </Link>
            {/* <span>{}</span> */}
            <h1 className="text-lg font-semibold"></h1>
            <div className="flex items-center gap-2">
              <Badge className={cn("  text-white pb-1 bg-gray-400")}>
                {isOtherOnline ? "Online" : "Offline"}
              </Badge>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {/* {userData?.email} */}
              </span>
            </div>
          </div>
          <div className="flex gap-4">
            <Dialog>
              <DialogTrigger>
                {" "}
                <UserIcon
                  size={26}
                  className="hover:opacity-60 transition-all"
                />{" "}
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle className="pb-2 font-bold text-3xl text-center">
                    User Profile
                  </DialogTitle>
                  <DialogDescription className="">
                    {" "}
                    <Profile
                      name={getCurrentUser()?.user.name ?? ""}
                      email={getCurrentUser()?.user.email ?? ""}
                      photoUrl={getCurrentUser()?.user.profile ?? ""}
                      key={2}
                    />
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger>
                {" "}
                <IoMdMore
                  size={26}
                  className="hover:opacity-60 transition-all"
                />{" "}
              </DialogTrigger>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle className="pb-2">
                    Chat Configuration:{" "}
                    {chatDetails.isGroupChat ? "Group" : "Private"}
                  </DialogTitle>
                  <DialogDescription className="">
                    {chatDetails.isGroupChat && (
                      <div className="py-5 flex gap-2 items-start">
                        <Input
                          onChange={(e) => setRenameText(e.target.value)}
                          value={RenameText}
                          placeholder="Enter Text To Rename Group"
                        />
                        <Button
                          disabled={
                            !RenameText.length ||
                            chatDetails.chatName === RenameText ||
                            IsLoading
                          }
                          onClick={async () => {
                            setIsLoading(true);

                            await chatService.renameGroupChat(
                              chatDetails._id,
                              RenameText
                            );
                            setIsLoading(false);

                            toast.success("Group Name Updated Successfully");
                            setChats((prev: Chat[]) => {
                              return prev.map((chat: Chat) => {
                                if (
                                  chat._id.toString() ===
                                  currentChatId.toString()
                                ) {
                                  // returning chat with updating chat-name
                                  return {
                                    ...chat,
                                    chatName: RenameText,
                                  };
                                } else return chat;
                              });
                            });
                            // r.refresh();
                          }}
                        >
                          Rename
                        </Button>
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      {chatDetails.isGroupChat ? (
                        <h1>
                          <span className="">Group Admin:</span>{" "}
                          <Badge>{chatDetails.groupAdmin.email} </Badge>
                        </h1>
                      ) : null}

                      <h2 className=" px-1"> Members</h2>
                      <div className="">
                        {chatDetails?.users?.map((_) => {
                          const isUserAnAdmin = chatDetails.isGroupChat
                            ? _._id === chatDetails.groupAdmin._id
                            : null;

                          return (
                            <UserCard
                              className="hover:bg-gray-200 active:bg-none"
                              user={_}
                            >
                              {chatDetails.isGroupChat ? (
                                <DropdownMenuComponent
                                  triggerText={
                                    <IoMdMore
                                      size={26}
                                      className="hover:opacity-40 transition-all"
                                    />
                                  }
                                  items={[
                                    { type: "label", text: "Edit User" },
                                    { type: "separator" },
                                    {
                                      type: "item",
                                      text: isUserAnAdmin
                                        ? "Exit Group"
                                        : "Remove " +
                                          truncateString(_.email, 8, "..."),
                                      icon: <IoMdExit size={20} />,
                                    },
                                    // @ts-ignore
                                    {
                                      ...(!isUserAnAdmin
                                        ? {
                                            type: "item",
                                            text: "Make Admin",
                                            icon: <UserIcon size={20} />,
                                          }
                                        : null),
                                    },
                                  ]}
                                />
                              ) : null}
                            </UserCard>
                          );
                        })}
                      </div>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <Button className="rounded-full" onClick={() => logout()}>
              <LogOutIcon />
            </Button>
          </div>
        </header>

        <div
          className="flex-1 overflow-auto p-4 md:p-6"
          id="p"
          ref={containerRef}
        >
          <MessagesList messages={Messages || []} />
        </div>
        {chatDetails && (
          <>
            {toggleFilesModal && (
              <FileInput
                title="Attachements"
                onFilesChange={(files_temp) => {
                  // @ts-ignore
                  console.log(files_temp, "files");
                  setFiles(files_temp);
                }}
                onlyPreview={false}
                // filesForPreview={files || []}
              />
            )}

            <MessageForm
              onSubmit={handleSendMessage}
              MessageText={MessageText}
              setMessageText={setMessageText}
              setToggleFilesModal={setToggleFilesModal}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatDetails;
