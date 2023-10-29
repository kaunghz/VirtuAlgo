let emailInput = document.getElementById("email");
let usernameInput = document.getElementById("username");
let passwordInput = document.getElementById("password");
let result = document.getElementById("result");


document.getElementById('show-password').addEventListener('change', function () {
	const passwordField = document.getElementById('password');
	passwordField.type = this.checked ? 'text' : 'password';
});

document.getElementById('show-password-repeat').addEventListener('change', function () {
	const passwordField = document.getElementById('password-repeat');
	passwordField.type = this.checked ? 'text' : 'password';
  });

document.getElementById("signup-form").addEventListener("submit", function(e) {
	e.preventDefault();

	fetch("/signup", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			email: emailInput.value,
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
})

// document.getElementById("create").addEventListener("click", () => {
// 	fetch("/signup", {
// 		method: "POST",
// 		headers: {
// 			"Content-Type": "application/json"
// 		},
// 		body: JSON.stringify({
// 			email: emailInput.value,
// 			username: usernameInput.value,
// 			plaintextPassword: passwordInput.value,
// 		})
// 	}).then((response) => {
// 		if (response.status === 200) {
// 			result.textContent = "Account was created";
// 			result.classList.remove("error");
// 		} else {
// 			result.textContent = "Account creation failed";
// 			result.classList.add("error");
// 		}
// 	});
// });