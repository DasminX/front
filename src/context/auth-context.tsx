import React, { FC, ReactNode, useState } from "react";
import { io } from "socket.io-client";
import { avatars } from "../utils/avatars";

// Types
type AuthContextType = {
  isAuth: boolean;
  login: (
    tokenString: string,
    incomingUserID: string,
    userAvatarImgUrl: string
  ) => void;
  logout: () => void;
  username: string;
  changeUsernameHandler: (username: string, isChanging: boolean) => void;
  userLogo: string;
  setChangeLogo: (imageUrl: string) => void;
  token: string;
  socket: any;
  userID: string;
};

// Functions
export const AuthContext = React.createContext<AuthContextType>({
  isAuth: false,
  login: (tokenString, incomingUserID, userAvatarImgUrl) => {},
  logout: () => {},
  username: "",
  changeUsernameHandler: (username, isChanging) => {},
  userLogo: "",
  setChangeLogo: (imageUrl) => {},
  token: "",
  socket: null,
  userID: "",
});

// Provider
export const AuthContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [userLogo, setUserLogo] = useState<string>("");
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [socket, setSocket] = useState<any>(null);
  const [userID, setUserID] = useState<string>("");

  const login = (
    tokenString: string,
    incomingUserID: string,
    userAvatarImgUrl: string
  ) => {
    setToken(tokenString);
    setIsAuth(true);
    setUserID(incomingUserID);
    setUserLogo(userAvatarImgUrl);
    setSocket(io("http://localhost:3008"));
  };

  const logout = () => {
    setToken("");
    setIsAuth(false);
    setUserID("");
    setUserLogo("");
    setSocket(null);
  };

  const setChangeLogo = (imageUrl: string) => {
    fetch("http://localhost:3008/api/profile/change-logo", {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ changedLogoUrl: imageUrl }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.status === "error")
          return console.log("nie udalo sie zmienic logo");
        setUserLogo(imageUrl);
      });
  };

  const changeUsernameHandler = (typedUsername: string, isChanging = false) => {
    if (typedUsername.trim() === username) return;

    // Case when im changing username from profile page - POSTing new username, saving in DB, getting back and saving in ctx
    if (isChanging) {
      console.log("changing");
      fetch("http://localhost:3008/api/profile/change-name", {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ changedName: typedUsername }),
      })
        .then((res) => res.json())
        .then((resData) => {
          //ERRORHANDLING PRZY WSZYSTKICH FETCHACH!!
          //ERRORHANDLING PRZY WSZYSTKICH FETCHACH!!
          //ERRORHANDLING PRZY WSZYSTKICH FETCHACH!!
          //ERRORHANDLING PRZY WSZYSTKICH FETCHACH!!
          console.log(resData);
          setUsername(resData.data.username);
        });
    } else {
      // Case when im changing username initially - getting user info when loggin in and saving in ctx
      console.log("initial");
      setUsername(typedUsername);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuth,
        login,
        logout,
        username,
        changeUsernameHandler,
        userLogo,
        setChangeLogo,
        token,
        socket,
        userID,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
