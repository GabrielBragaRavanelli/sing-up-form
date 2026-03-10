const form = document.querySelector('.formulario');

if (form) {
	const fields = {
		name: document.getElementById('name'),
		lastname: document.getElementById('lastname'),
		email: document.getElementById('email'),
		password: document.getElementById('password')
	};

	const submitButton = form.querySelector('button[type="submit"]');
	const storageKey = 'signupFormDraft';

	Object.values(fields).forEach((input) => {
		const inputBox = input.closest('.input-box');
		let errorElement = inputBox.querySelector('.error-message');

		if (!errorElement) {
			errorElement = document.createElement('small');
			errorElement.className = 'error-message';
			errorElement.setAttribute('aria-live', 'polite');
			inputBox.appendChild(errorElement);
		}
	});

	const passwordBox = fields.password.closest('.input-box');
	passwordBox.classList.add('has-toggle');

	const toggleButton = document.createElement('button');
	toggleButton.type = 'button';
	toggleButton.className = 'toggle-password';
	toggleButton.textContent = 'Mostrar';
	toggleButton.setAttribute('aria-label', 'Mostrar senha');
	passwordBox.appendChild(toggleButton);

	let feedback = form.querySelector('.form-feedback');
	if (!feedback) {
		feedback = document.createElement('p');
		feedback.className = 'form-feedback';
		feedback.setAttribute('aria-live', 'polite');
		form.querySelector('.terms').after(feedback);
	}

	const validators = {
		name: (value) => {
			if (value.trim().length < 2) {
				return 'Digite pelo menos 2 caracteres no nome.';
			}
			return '';
		},
		lastname: (value) => {
			if (value.trim().length < 2) {
				return 'Digite pelo menos 2 caracteres no sobrenome.';
			}
			return '';
		},
		email: (value) => {
			const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
			if (!emailPattern.test(value.trim())) {
				return 'Informe um e-mail valido.';
			}
			return '';
		},
		password: (value) => {
			if (value.length < 8) {
				return 'A senha precisa ter no minimo 8 caracteres.';
			}
			if (!/[A-Z]/.test(value)) {
				return 'Inclua ao menos 1 letra maiuscula na senha.';
			}
			if (!/\d/.test(value)) {
				return 'Inclua ao menos 1 numero na senha.';
			}
			return '';
		}
	};

	function setFieldState(input, message) {
		const inputBox = input.closest('.input-box');
		const errorElement = inputBox.querySelector('.error-message');

		input.classList.remove('input-error', 'input-success');

		if (message) {
			input.classList.add('input-error');
			errorElement.textContent = message;
			return false;
		}

		if (input.value.trim()) {
			input.classList.add('input-success');
		}
		errorElement.textContent = '';
		return true;
	}

	function validateField(input) {
		const validator = validators[input.name];
		const message = validator ? validator(input.value) : '';
		return setFieldState(input, message);
	}

	function validateForm() {
		const result = Object.values(fields).every((input) => validateField(input));
		submitButton.disabled = !result;
		return result;
	}

	function saveDraft() {
		const draft = {
			name: fields.name.value,
			lastname: fields.lastname.value,
			email: fields.email.value,
			password: fields.password.value
		};
		localStorage.setItem(storageKey, JSON.stringify(draft));
	}

	function restoreDraft() {
		const raw = localStorage.getItem(storageKey);
		if (!raw) {
			return;
		}

		try {
			const draft = JSON.parse(raw);
			Object.keys(fields).forEach((key) => {
				if (typeof draft[key] === 'string') {
					fields[key].value = draft[key];
				}
			});
		} catch (error) {
			localStorage.removeItem(storageKey);
		}
	}

	Object.values(fields).forEach((input) => {
		input.addEventListener('input', () => {
			validateField(input);
			const allValid = Object.values(fields).every((currentInput) => {
				const validator = validators[currentInput.name];
				return validator ? !validator(currentInput.value) : true;
			});
			submitButton.disabled = !allValid;
			feedback.textContent = '';
			saveDraft();
		});

		input.addEventListener('blur', () => {
			validateField(input);
		});
	});

	toggleButton.addEventListener('click', () => {
		const showPassword = fields.password.type === 'password';
		fields.password.type = showPassword ? 'text' : 'password';
		toggleButton.textContent = showPassword ? 'Ocultar' : 'Mostrar';
		toggleButton.setAttribute('aria-label', showPassword ? 'Ocultar senha' : 'Mostrar senha');
	});

	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		if (!validateForm()) {
			feedback.textContent = 'Corrija os campos destacados para continuar.';
			return;
		}

		submitButton.disabled = true;
		submitButton.classList.add('is-loading');
		const originalText = submitButton.textContent;
		submitButton.textContent = 'Enviando...';
		feedback.textContent = '';

		await new Promise((resolve) => setTimeout(resolve, 1500));

		submitButton.classList.remove('is-loading');
		submitButton.textContent = 'Cadastro concluido!';
		feedback.textContent = 'Teste gratuito ativado com sucesso.';

		localStorage.removeItem(storageKey);
		form.reset();

		Object.values(fields).forEach((input) => {
			input.classList.remove('input-error', 'input-success');
			const inputBox = input.closest('.input-box');
			const errorElement = inputBox.querySelector('.error-message');
			errorElement.textContent = '';
		});

		setTimeout(() => {
			submitButton.textContent = originalText;
			submitButton.disabled = true;
		}, 1500);
	});

	restoreDraft();
	validateForm();
}
