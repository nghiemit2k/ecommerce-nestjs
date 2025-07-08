import { Injectable } from "@nestjs/common";
import { Resend } from "resend";
import envConfig from "../config";
import PlaidVerifyIdentityEmail from "emails/otp";
import React from "react";

@Injectable()
export class EmailService {
    private resend: Resend
    constructor() {
        this.resend = new Resend(envConfig.RESEND_API_KEY)
    }

    sendOTP(payload: { email: string, code: string }) {
        const subject = 'OTP Code'
        return this.resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: [payload.email],
            subject,
            react: <PlaidVerifyIdentityEmail validationCode={payload.code} title={subject} />
        });
    }
}