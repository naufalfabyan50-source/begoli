const KEY = "emails";

export const getEmails = () =>
JSON.parse(localStorage.getItem(KEY) || "[]");

export const createEmailEntry = (data) => {
const items = getEmails();
items.push({
id: Date.now(),
status: "pending",
...data
});
localStorage.setItem(KEY, JSON.stringify(items));
};

export const updateEmailStatus = (id,status) => {
const items = getEmails();
const index = items.findIndex(x => x.id === id);

if(index !== -1){
items[index].status = status;
localStorage.setItem(KEY, JSON.stringify(items));
}
};
