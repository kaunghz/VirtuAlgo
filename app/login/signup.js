let usernameInput = document.getElementById("username");
let passwordInput = document.getElementById("password");
let result = document.getElementById("result");

document.getElementById("create").addEventListener("click", () => {
	fetch("/signup", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			username: usernameInput.value,
			plaintextPassword: passwordInput.value,
		})
	}).then((response) => {
		if (response.status === 200) {
			result.textContent = "Account was created";
			result.classList.remove("error");
		} else {
			result.textContent = "Account creation failed";
			result.classList.add("error");
		}
	});
});