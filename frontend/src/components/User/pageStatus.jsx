import arch from "../../assets/architecture.png";
import autonomy from "../../assets/autonomy.png";
import easy from "../../assets/easy.png";
import unit from "../../assets/unit.png";
import tunnel from "../../assets/tunnel.png";
import Animate from "rc-animate";
import { useEffect, useState } from "react";
import { LoadingOutlined, BulbOutlined } from "@ant-design/icons";
import { Result, Button, Typography } from "antd";

const { Paragraph, Text, Link } = Typography;

const introList = [
  {
    img: autonomy,
    title: "边缘自治",
    desc: `当边缘节点处于离线状态或边缘网络间歇性断联时，保证业务容器可以持续运行在边缘节点上。这意味着即使节点重启,
    边缘业务容器仍可自动恢复。同时当网络恢复正常后，边缘节点自动同步业务容器最新状态，确保应用持续无缝地运行。`,
  },
  {
    img: tunnel,
    title: "云边协同",
    desc: `为位于Intranet内部的边缘节点提供安全的云边双向认证的加密通道，确保在边到云网络单向连通的边缘计算场景下，用户仍可运行原生kubernetes运维命令(如kubectl exec/logs等)。同时中心式的运维监控系统(如prometheus, metrics-server等)也可以通过云边通道获取到边缘的监控数据。`,
  },
  {
    img: unit,
    title: "边缘单元化",
    desc: `从单元化的视角，轻松管理分散在不同地域的边缘资源，并对各地域单元内的业务提供独立的生命周期管理，升级，扩缩容，流量闭环等能力。且业务无需进行任何适配或改造。`,
  },
  {
    img: easy,
    title: "无缝转换",
    desc: `提供yurtctl工具，方便用户一键式将原生Kubernetes集群转换为具备边缘能力的OpenYurt集群，或者将OpenYurt集群还原为原生Kubernetes集群。 同时OpenYurt组件运行所需的额外资源和维护成本很低。      `,
  },
];

// OpenYurt LOGO with short description
// display along with login/register form
export function IntroBlock() {
  return (
    <Animate transitionName="fade">
      <div className="login-intro">
        <img src={arch} alt="openyurt-arch"></img>
        <div className="login-intro-word">
          Extending Kubernetes to Edge
          <a
            style={{ display: "block", fontSize: 21 }}
            href="https://openyurt.io"
          >
            Learn More About OpenYurt &gt;
          </a>
        </div>
      </div>
    </Animate>
  );
}

// display Loading status along with OpenYurt detailed description
export function LoadingBlock() {
  const [id, setId] = useState(0);

  // switch the gallary content every 4s
  useEffect(() => {
    let handler = setInterval(
      () => setId((i) => (i + 1) % introList.length),
      3000
    );
    return handler ? () => clearInterval(handler) : null;
  }, []);

  return (
    <div>
      <Animate transitionName="fade" transitionLeave={false}>
        <LoadingCard
          img={introList[id].img}
          title={introList[id].title}
          desc={introList[id].desc}
          key={id}
        ></LoadingCard>
      </Animate>
      <div className="login-intro-loading-tips">
        正在为您创建OpenYurt试用平台账号，请稍等
        <LoadingOutlined style={{ marginLeft: 8 }} />
      </div>
    </div>
  );
}

function LoadingCard({ img, title, desc }) {
  return (
    <div className="login-intro-loading">
      <div className="login-intro-loading-col">
        <div>
          <h4>{title}</h4>
          <p>{desc}</p>
        </div>
      </div>
      <div className="login-intro-loading-image login-intro-loading-col">
        <img src={img} alt={title}></img>
      </div>
    </div>
  );
}

// status
// success, error
export function CompleteBlock({ res }) {
  // construct info based on res
  let info = {
    status: res.rstatus,
    buttonFn: res.buttonFn,
  };
  if (res.rstatus === "success") {
    info = {
      ...info,
      title: "恭喜您😀，注册成功",
      subTitle: `您的账号信息，账号：${res.spec.mobilephone},  密码：${res.spec.token}`,
      buttonTxt: "Go to Login",
      tipTitle: "在进入Web控制台前，请先阅读以下说明:",
      tips: [
        <span>
          您的试用平台账号默认有效期为7天，7天之后系统会自动注销您的账号，并清空相关资源
        </span>,
        <span>
          您的试用平台账号为您注册时填写的手机号📱
          <Text mark>{res.spec.mobilephone} </Text>，密码🔑{" "}
          <Text mark>{res.spec.token}</Text>
          ，请妥善保管
        </span>,
        <span>
          若您还有其他问题可向
          <Link
            target="_blank"
            rel="noreferrer noopener"
            href="https://github.com/openyurtio/openyurt#contact"
          >
            OpenYurt社区
          </Link>
          反馈
        </span>,
      ],
    };
  } else {
    info = {
      ...info,
      title: "抱歉，出了点小问题😕",
      buttonTxt: "Back to Register",
      subTitle: (
        <div>
          <p style={{ color: "red" }}>ERROR: {res.msg}</p>
          <div>
            请重试当前操作，若仍出现问题可向
            <a
              target="_blank"
              rel="noreferrer noopener"
              href="https://github.com/openyurtio/openyurt#contact"
            >
              OpenYurt社区
            </a>
            反馈
          </div>
        </div>
      ),
    };
  }

  return (
    <Result
      status={info.status}
      title={info.title}
      subTitle={info.subTitle}
      style={{ margin: "auto", maxWidth: "800px" }}
      extra={[
        <Button type="primary" onClick={info.buttonFn}>
          {info.buttonTxt}
        </Button>,
      ]}
    >
      {info.tipTitle ? (
        <div>
          <Paragraph>
            <Text
              strong
              style={{
                fontSize: 16,
              }}
            >
              {info.tipTitle}
            </Text>
          </Paragraph>
          {info.tips.map((txt, i) => (
            <Paragraph key={i}>
              <BulbOutlined className="site-result-demo-error-icon" /> &nbsp;
              {txt}
            </Paragraph>
          ))}
        </div>
      ) : null}
    </Result>
  );
}
