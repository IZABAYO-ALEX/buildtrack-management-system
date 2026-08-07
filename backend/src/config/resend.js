import resend from "../config/resend.js";

class EmailService {

    async sendWelcomeEmail(user) {

        return await resend.emails.send({

            from: process.env.EMAIL_FROM,

            to: user.email,

            subject: "Welcome to BuildTrack",

            html: `
                <h2>Hello ${user.fullName}</h2>

                <p>Your BuildTrack account has been created successfully.</p>

                <p><strong>Role:</strong> ${user.role}</p>

                <p><strong>Email:</strong> ${user.email}</p>

                <p><strong>Temporary Password:</strong> ${user.password}</p>

                <br>

                <a href="${process.env.CLIENT_URL}">
                    Login to BuildTrack
                </a>
            `
        });

    }

}

export default new EmailService();