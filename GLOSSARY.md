# Careery

A personal, local-first tool for creating job-specific Resumes from reusable career content and exporting them as PDFs.

## Language

**Career Record**:
The reusable pool of career information, with English wording and optional Arabic wording. Profiles and Resumes can copy from it; changes to the source do not change existing copies.
_Avoid_: library, master data, database

**Profile**:
A career-specific collection of editable content and a place to organize Resumes. It starts with content copied from the Career Record and provides a starting selection for new Resumes.
_Avoid_: account, master profile, track

**Resume**:
An independently editable document for a particular job, organized under a Profile or in Unfiled. It starts empty or with copied Profile content, can receive content from the Career Record, and uses English or Arabic for its PDF.
_Avoid_: CV, variant

**Unfiled**:
The area containing Resumes that do not currently belong to a Profile.
_Avoid_: default profile, orphaned resumes

**Move**:
Changing which Profile contains a Resume, or moving it to or from Unfiled, without changing its content.
_Avoid_: duplicate, recreate

**CV**:
A comprehensive career document planned after v1, distinct from a job-specific Resume.
_Avoid_: Using CV as a synonym for Resume
