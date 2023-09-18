export function simulateDelay(timeDelayByCall: number[], name: string) {
  let callCount = 0;

  console.log('next userInfo delay will be ' + (timeDelayByCall.length ? timeDelayByCall[callCount] : 0) + ' seconds');
  return function () {
    return wait(timeDelayByCall[callCount++] * 1000).then(a => {
      console.log('next userInfo delay will be ' + (timeDelayByCall[callCount] || 0) + ' seconds');
      return a;
    });
  };
}

function wait(milliseconds: number) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
}
