import { useState } from "react";
import { CompleteBlock, IntroBlock, LoadingBlock } from "./pageStatus";
import RegisterForm from "./RegisterForm";
import LoginForm from "./LoginForm";
import { sendRequest } from "../../utils/request";

// the whole /login page
// pageStatus ?
//  = loading: waiting for registering
//  = complete: register success or fail
//  = login: login form
//  = register: register form
export default function LoginPage() {
  const [pageStatus, setStatus] = useState("login");
  const [requestRes, setRes] = useState(null);

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
          setRes(res);
        },
        (err) => {
          // err callback
          setRes({
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
        <CompleteBlock res={requestRes} />
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
            initState={requestRes}
          />
        </div>
      )}
    </div>
  );
}
