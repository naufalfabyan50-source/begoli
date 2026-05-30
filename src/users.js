const KEY = "users";

export const getUsers = () =>
JSON.parse(localStorage.getItem(KEY) || "[]");

export const createUser = (data) => {
const users = getUsers();
users.push({
id: Date.now(),
...data
});
localStorage.setItem(KEY, JSON.stringify(users));
};
