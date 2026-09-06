window.Login = {

    async init() {

        const form = document.getElementById("loginForm");
        const errorText = document.getElementById("loginError");

        if (!form) return;

        form.addEventListener("submit", async (event) => {

            event.preventDefault();

            const email = document.getElementById("loginEmail").value.trim();
            const password = document.getElementById("loginPassword").value;

            errorText.textContent = "";

            const { error } = await SupabaseClient.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                errorText.textContent = "Correo o contraseña incorrectos.";
                return;
            }

            Router.go("dashboard");
        });
    }

};