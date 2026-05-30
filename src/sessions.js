const KEY = "sessions";

export const getSessions = () =>
JSON.parse(localStorage.getItem(KEY) || "[]");

export const createSession = (data) => {
const items = getSessions();
items.push({
id: Date.now(),
status: "active",
...data
});
localStorage.setItem(KEY, JSON.stringify(items));
};

export const updateSessionStatus = (id,status) => {
const items = getSessions();
const index = items.findIndex(x => x.id === id);

if(index !== -1){
items[index].status = status;
localStorage.setItem(KEY, JSON.stringify(items));
}
};
