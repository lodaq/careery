'use client';
import { ApplicationForm, AppField } from './ApplicationForm';
export default function ApplicationCreate() { return <section className="application-section"><h2>New application</h2><ApplicationForm destination="detail" label="Add application"><div className="application-fields"><AppField name="company" label="Company" required /><AppField name="role" label="Job title" required /></div></ApplicationForm></section>; }
