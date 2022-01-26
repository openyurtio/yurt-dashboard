import { withRouter } from "react-router-dom";

const GithubLoginFinish = ({ history }) => {
  history.push({
    pathname: "/clusterInfo",
    state: {
      msg: "登录成功！请开始体验吧😀。",
      type: "info",
      duration: 3,
    },
  });
  return <></>;
};

export default withRouter(GithubLoginFinish);
