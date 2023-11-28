let emailInput = document.getElementById("email");
let usernameInput = document.getElementById("username");
let passwordInput = document.getElementById("password");
let passwordRepeatInput = document.getElementById("password-repeat");
let result = document.getElementById("result");
let usernameErrorMsg = document.getElementById("username-error-msg");
let passwordErrorMsg = document.getElementById("password-error-msg");
let passwordRepeatErrorMsg = document.getElementById("password-repeat-error-msg");

function validateUsername(username) {
	const validUsernameRegex = /^[A-Za-z0-9]{1,20}$/;
	return validUsernameRegex.test(username);
}

function validatePassword(password) {
	const validRegexPasswordCheck = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,25})/;
	return validRegexPasswordCheck.test(password);

}

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
	usernameErrorMsg.textContent = "";
	passwordErrorMsg.textContent = "";
	passwordRepeatErrorMsg.textContent = "";

	if(!usernameInput.value || !validateUsername(usernameInput.value)) {
		usernameErrorMsg.textContent = "Invalid Username: Must be of length 1-20 and only contain letters and numbers.";
	} else if(!passwordInput.value || !validatePassword(passwordInput.value)) {
		passwordErrorMsg.textContent = "Invalid Password: Must be of length 8-25 and contain at least 1 capital letter, at least 1 number, and at least 1 sepcial character."
	} else if(!passwordRepeatInput.value || (passwordRepeatInput.value !== passwordInput.value)) {
		passwordRepeatErrorMsg.textContent = "Error: Passwords do not match.";
	}
	else {
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
				result.textContent = "Account Creation Successful. Redirecting you to the Home Page of VirtuAlgo...";
				result.classList.remove("error");
				setTimeout(function() {
					window.location.href = "index.html";
				}, 500);
			} else {
				result.textContent = "Account creation failed";
				result.classList.add("error");
			}
		});
	}


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