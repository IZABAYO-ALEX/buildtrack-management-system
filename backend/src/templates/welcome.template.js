export const welcomeTemplate = (user, password) => `
<!DOCTYPE html>
<html>

<head>
<style>

body{
    font-family:Arial,sans-serif;
}

.card{
    max-width:600px;
    margin:auto;
    padding:30px;
    border:1px solid #ddd;
    border-radius:10px;
}

.button{
    display:inline-block;
    background:#2563eb;
    color:white;
    padding:12px 20px;
    text-decoration:none;
    border-radius:5px;
}

</style>
</head>

<body>

<div class="card">

<h2>Welcome to BuildTrack</h2>

<p>Hello ${user.fullName},</p>

<p>Your account has been created successfully.</p>

<hr>

<p><strong>Role:</strong> ${user.role}</p>

<p><strong>Email:</strong> ${user.email}</p>

<p><strong>Temporary Password:</strong> ${password}</p>

<br>

<a
class="button"
href="${process.env.CLIENT_URL}"
>

Login

</a>

</div>

</body>

</html>
`;