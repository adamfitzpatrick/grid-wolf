# @grid-wolf/shared/dependencies

This folder within the `shared` package is designed to contain only NPM dependencies so that they
can be uploaded as a **Lambda Layer** for inclusion with other lambdas.  The layout of the folder
permits dependencies to be referenced within a lambda handler using standard TypeScript import
syntax, which, when transpiled to javascript and uploaded as function code to AWS Lambda, can be
be found in the layer in the expected path.

The contents of this folder must be deployed with CDK as a `LayerVersion`, and referenced within
the infrastructure definition of a consuming lambda function.

Note that, because the dependencies for this package cannot be install with Yarn PnP, this folder
is not part of other Yarn workspaces.
