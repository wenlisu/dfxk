export function getQueryString(name: string, url: string, ) {
  const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, 'i');
  
  const r = url.split('?')[1].match(reg);
  if (r !== null) {
    return unescape(r[2]);
  }
  return null;
}