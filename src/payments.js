const KEY = "payments";

export const getPayments = () =>
JSON.parse(localStorage.getItem(KEY) || "[]");

export const createPayment = (data) => {
const items = getPayments();
items.push({
id: Date.now(),
status: "pending",
...data
});
localStorage.setItem(KEY, JSON.stringify(items));
};

export const updatePaymentStatus = (id,status) => {
const items = getPayments();
const index = items.findIndex(x => x.id === id);

if(index !== -1){
items[index].status = status;
localStorage.setItem(KEY, JSON.stringify(items));
}
};
