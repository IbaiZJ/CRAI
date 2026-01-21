/**
 * Cookie utility functions for managing authentication tokens and user data
 */

export function getCookie(name: string): string | null {
  const nameEQ = name + '=';
  const cookies = document.cookie.split(';');
  
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  
  return null;
}

export function setCookie(name: string, value: string, days: number = 7): void {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  
  const expires = `expires=${date.toUTCString()}`;
  const cookieValue = `${name}=${encodeURIComponent(value)};${expires};path=/`;
  
  document.cookie = cookieValue;
}

export function deleteCookie(name: string): void {
  setCookie(name, '', -1);
}
