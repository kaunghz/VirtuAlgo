let usernameInput = document.getElementById("username");
let passwordInput = document.getElementById("password");
let result = document.getElementById("result");

document.getElementById("login-form").addEventListener("submit", function(e) {
	e.preventDefault();

	fetch("/signin", {
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
			result.textContent = "Login successful. Redirecting you to the Home Page of VirtuAlgo...";
			result.classList.remove("error");
			//window.location.href = "../public/index.html";
		} else {
			result.textContent = "Login failed";
			result.classList.add("error");
		}
	});
});
