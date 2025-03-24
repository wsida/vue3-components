export function throttleControl(
  func: (...args: any[]) => void,
  delay: number
): { handler: (...args: any[]) => void; stop: () => void } {
  let lastExecTime = 0; // 上次执行的时间
  let timer = null; // 定时器

  return {
      handler: function (...args) {
          const currentTime = Date.now(); // 当前时间
          const timeSinceLastExec = currentTime - lastExecTime; // 距离上次执行的时间

          // 如果距离上次执行的时间超过了 delay，则立即执行
          if (timeSinceLastExec >= delay) {
              if (timer) {
                  clearTimeout(timer); // 清除之前的定时器
                  timer = null;
              }
              func.apply(this, args); // 执行回调
              lastExecTime = currentTime; // 更新上次执行时间
          } else if (!timer) {
              // 如果未达到 delay 时间，且没有定时器，则设置定时器
              timer = setTimeout(() => {
                  func.apply(this, args); // 执行回调
                  lastExecTime = Date.now(); // 更新上次执行时间
                  timer = null; // 清除定时器
              }, delay - timeSinceLastExec);
          }
      },
      stop() {
          if (timer) {
              clearTimeout(timer); // 清除之前的定时器
              timer = null;
          }
      },
  };
}
