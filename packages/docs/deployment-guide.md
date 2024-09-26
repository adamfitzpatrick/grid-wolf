# grid-wolf Deployment

## Prerequisites

### SSM Parameter Store

- /grid-wolf/cdn-public-key *Public key for accessing restricted CloudFront assets*

### Secrets Manager

Stored in secret named **/grid-wolf/deploy-secrets**:

- cdn-private-key *Private key for signing URLs for restricted CloudFront assets*
