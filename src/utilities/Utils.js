/* eslint-disable no-restricted-syntax */
const classNames = (...args) => {
  const cssClasses = [];
  for (const arg of args) {
    if (typeof arg === 'string') {
      cssClasses.push(arg);
    } else if (typeof arg === 'object') {
      // Read through all keys and in case their value translates to true,
      // append it to cssClasses, else ignore
      Object.entries(arg).forEach(([key, value]) => {
        if (value) {
          cssClasses.push(key);
        }
      });
    }
  }
  return cssClasses.filter((c) => c).join(' ');
};

const getEllipses = (name, threshold) => {
  if (threshold === 0) return name;
  if (name?.length > threshold) {
    return `${name.substring(0, threshold - 1)}...`;
  }
  return name;
};

const getGreetingMessage = () => {
  const hours = new Date().getHours();
  const isDayTime = hours < 17;
  return `Good ${isDayTime ? 'morning' : 'evening'}`;
};

const getLoggedInUserIcon = (name) => {
  let userIcon = '';
  if (name) {
    const words = name.split(' ');
    userIcon += words[0].charAt(0);
    if (words.length > 1) userIcon += words[words.length - 1].charAt(0);
    else userIcon += words[0].charAt(1);
  }
  return userIcon;
};

export {
  classNames, getEllipses, getGreetingMessage, getLoggedInUserIcon,
};
