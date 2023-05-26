import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Socket } from 'socket.io-client';
import { Divider, List, ListItem, ListItemAvatar } from '@mui/material';

export function StackTextField(props: any) {
  return (
    <div className="">
      <TextField
        variant="standard" {...props}
        inputProps={{
          maxLength: 25
        }}
      />
    </div>
  );
}

export function StackButton(props: any) {
  return (
    <div className="">
      <TextField {...props} />
    </div>
  );
}

export function ChatList(props: any) {
  return (
    <div>
    {props.msg.map((data: any, idx: any) => {
      return (
        <List key={idx}>
          <ListItem>
            <ListItemAvatar>
              <div>{data.user}</div>
            </ListItemAvatar>
            <div>
              <div>{data.content}</div>
              {/* <div style={{position: 'relative', top: '15px'}}>{i.date}</div> */}
            </div>
          </ListItem>
        {/* <Divider in={true} /> */}
        </List>
      )
    })
    }
    </div>
  );
}

export function Register() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [socket, setSocket]: [Socket | undefined, React.Dispatch<Socket | undefined>] = useState();
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([] as any[]);

  function signUp() {
    axios.post(`${process.env.REACT_APP_REMOTE_URL}/register`, {
      name: name,
      password: password
    })
      .then((response) => {
        console.log("response:", response);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  function signIn() {
    console.log("signIn", name, password);
    axios.post(`${process.env.REACT_APP_REMOTE_URL}/auth`, {
      name: name,
      password: password
    })
      .then((response) => {
        console.log("response:", response);
        if (response.status === 200) {
          const result = response.data;
          if (result.code === 0) {
            setToken(result.data);
            return;
          }
        }
        setToken("");
      })
      .catch(function (error) {
        setToken("");
        console.log(error);
      });
  }

  function sendChat() {
    socket?.emit("chat", {
      user: name,
      content: message
    });
  }

  useEffect(() => {
    function onConnect() {
      console.log("onConnect");
    }

    function onDisconnect() {
      console.log("onDisconnect");
    }

    function initSocket(token: string) {
      console.log("initSocket");

      setSocket(
        io(`${process.env.REACT_APP_REMOTE_URL}`, {
          auth: {
            token: token
          }
        })
        .on('connect', onConnect)
        .on('disconnect', onDisconnect)
        .on("chat", (res) => {
          const data = res.data;
          setChats(prev => [...prev, data]);
        })
      );

      return socket;
    }

    if (token !== "" && !socket) {
      initSocket(token);
    }
  }, [token, socket, chats]);

  if (token !== "") {
    return (
      <div>
        <ChatList msg={chats}/>
        <StackTextField
          onChange={(e: any) => setMessage(e.target.value)}
          label="輸入內容"
        />
        <Button onClick={sendChat}>發送</Button>
      </div>
    );
  } else {
    return (
      <div>
        <StackTextField
          onChange={(e: any) => setName(e.target.value)}
          label="帳號"
        />
        <StackTextField
          onChange={(e: any) => setPassword(e.target.value)}
          label="密碼"
          type="password"
        />
        <Button onClick={signUp}>註冊</Button>
        <Button onClick={signIn}>登入</Button>
      </div>
    );
  }
}
