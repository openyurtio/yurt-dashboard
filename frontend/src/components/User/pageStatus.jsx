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
    img: tunnel,
    title: "开箱即用的云边端协同能力",
    desc: `OpenYurt 采用了云边端一体化架构，实现了在云端统一管理海量边缘资源及业务的能力。
    一方面，OpenYurt 无缝融合云上已有的能力，包括与弹性、智能运维、日志、DevOps 等能力融合，保证了边缘资源和业务的少运维、高可用。另一方面，借助云边端一体化的通道，将大量云上的能力，包括中间件、安全、AI、存储及网络管理等能力下沉到边缘，减少常见云服务在边缘侧的自建成本。`,
  },
  {
    img: autonomy,
    title: "强大的边缘业务自愈能力",
    desc: `在原生 Kubernetes 中，边缘节点离线状态下边缘节点重启，节点上边缘业务无法自动恢复，从而导致边缘业务的服务中断。通过 OpenYurt强大的边缘业务自愈能力，可以轻松解决节点离线和节点重启对边缘业务的影响，确保边缘业务可靠并持续的运行。当边缘节点网络恢复后，边缘业务的状态将与云端管控同步并保持数据的一致性。`,
  },
  {
    img: easy,
    title: "丰富的边缘业务编排能力",
    desc: `针对边缘场景，OpenYurt 开创性的提出了单元化的概念, 可以做到将资源，应用，服务流量在本单元内闭环。在资源层面，抽象出节点池的能力，边缘站点资源可以根据地域分布进行分类划分，在应用管理层面，设计了一整套应用部署模型，例如单元化部署、单元化DaemonSet、边缘 Ingress 等模型，在流量服务层面，可以做到流量在本节点池内闭环访问。`,
  },
  {
    img: unit,
    title: "云原生的设备管理能力",
    desc: `OpenYurt 从云原生视角对边缘终端设备的基本特征（是什么）、主要能力（能做什么）、产生的数据（能够传递什么信息）进行了抽象与定义。凭借良好的生态兼容性无缝集成了业界主流的IoT设备管理解决方案。最终通过云原生声明式API，向开发者提供设备数据采集处理与管理控制的能力。`,
  },
];

// OpenYurt LOGO with short description
// display along with login/register form
export function IntroBlock() {
  return (
    <Animate transitionName="fade">
      <div className="login-intro">
        <img src={arch} style={{ maxWidth: "100%" }} alt="openyurt-arch"></img>
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
        <Button type="primary" key="1" onClick={info.buttonFn}>
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
