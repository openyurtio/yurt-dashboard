import { useState } from "react";

import { CompleteBlock, IntroBlock, LoadingBlock } from "./pageStatus";
import RegisterForm from "./RegisterForm";
import LoginForm from "./LoginForm";
import { sendRequest } from "../../utils/request";
import { useLocationMsg } from "../../utils/hooks";

// the /login page
// pageStatus ?
//  = loading: waiting for registering
//  = complete: register success or fail
//  = login: login form
//  = register: register form
export default function LoginPage() {
  // display expiration msg while entering
  useLocationMsg();

  const [pageStatus, setStatus] = useState("login");

  // completeBlockInfo struct definition
  //  .rstatus    "error"/"success"
  //  .msg        errMsg
  //  .buttonFn   clickBtn callback fn
  const [completeBlockInfo, setComplete] = useState(null);

  const doRegist = (formData) => {
    setStatus("loading");
    sendRequest("/register", formData)
      .then(
        (res) => {
          // success callback
          res.rstatus = "success";
          res.buttonFn = () => {
            setStatus("login");
          };
          setComplete(res);
        },
        (err) => {
          // err callback
          setComplete({
            rstatus: "error",
            msg: err.message,
            buttonFn: () => {
              setStatus("register");
            },
          });
        }
      )
      .then(() => setStatus("complete"));
  };

  return (
    <div style={{ margin: "auto 0" }}>
      {pageStatus === "loading" ? (
        <LoadingBlock />
      ) : pageStatus === "complete" ? (
        <CompleteBlock res={completeBlockInfo} />
      ) : pageStatus === "register" ? (
        <div className="login">
          <IntroBlock />
          <RegisterForm
            register={doRegist}
            goToLogin={() => setStatus("login")}
          />
        </div>
      ) : (
        <div className="login">
          <IntroBlock />
          <LoginForm
            gotoRegister={() => setStatus("register")}
            initState={completeBlockInfo}
          />
        </div>
      )}
    </div>
  );
}
