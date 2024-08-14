/**
 * 生成随机字符串
 * @param length
 * @returns 随机字符串
 */
export default function generateRandomString(length = 8): string {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const characters = charset.split("");
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters[Math.floor(Math.random() * charactersLength)];
  }
  return result;
}
