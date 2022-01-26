import { useState } from "react";
import "./login.css";
import { CompleteBlock, IntroBlock, LoadingBlock } from "./pageStatus";
import RegisterForm from "./RegisterForm";
import LoginForm from "./LoginForm";
import GithubLoginFinish from "./AuthLogin";
import { sendRequest } from "../../utils/request";
import { useLocation } from "react-router-dom";
import { setUserProfile } from "../../utils/utils";

// the /login page
// pageStatus ?
//  = loading: waiting for registering
//  = complete: register success or fail
//  = login: login form
//  = register: register form
//  = githubAuth: waiting for github authorization login
export default function LoginPage() {
  const [pageStatus, setStatus] = useState("login");

  // completeBlockInfo struct definition
  //  .rstatus    "error"/"success"
  //  .msg        errMsg
  //  .buttonFn   clickBtn callback fn
  const [completeBlockInfo, setComplete] = useState(null);

  // the authorization code from github redirect url
  const code = useLocation().search.split("=")[1];

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

  const doGithubLogin = (code) => {
    setStatus("loading");
    var value = { code: code };
    sendRequest("/github", value)
      .then(
        (user) => {
          setUserProfile(user);
        },
        (err) => {
          alert(err);
        }
      )
      .then(() => setStatus("githubAuth"));
  };

  return (
    <div style={{ margin: "auto 0" }}>
      {code !== undefined && pageStatus === "login" ? (
        doGithubLogin(code)
      ) : pageStatus === "loading" ? (
        <LoadingBlock />
      ) : pageStatus === "complete" ? (
        <CompleteBlock res={completeBlockInfo} />
      ) : pageStatus === "githubAuth" ? (
        <GithubLoginFinish />
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
