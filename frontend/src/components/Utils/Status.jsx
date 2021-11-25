const colorState = {
  success: "#62CB35",
  ready: "#62CB35",
  正常: "#62CB35",
  fail: "#F74336",
  loading: "#1A73E8",
  running: "#62CB35",
};

export function Status({ status }) {
  let statusKey = status && status.toLowerCase();
  return (
    <div>
      <span
        className="cluster-status"
        style={{
          backgroundColor:
            statusKey in colorState ? colorState[statusKey] : colorState.fail,
        }}
      ></span>
      {status}
    </div>
  );
}
