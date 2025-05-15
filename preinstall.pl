#!/usr/bin/perl
use strict;
use warnings;

my $token = qx("aws codeartifact get-authorization-token --domain stepinto --domain-owner 913697957162 --region us-west-2 --query authorizationToken --output text --profile stepinto");
system('yarn config set npmRegistries[\"https://stepinto-913697957162.d.codeartifact.us-west-2.amazonaws.com/npm/stepinto/\"].npmAuthToken ' . $token);

open(NPMRC, '>', '.npmrc') or die $!;
print NPMRC "registry=https://stepinto-913697957162.d.codeartifact.us-west-2.amazonaws.com/npm/stepinto/ //stepinto-913697957162.d.codeartifact.us-west-2.amazonaws.com/npm/stepinto/:always-auth=true
  //stepinto-913697957162.d.codeartifact.us-west-2.amazonaws.com/npm/stepinto/:_authToken=$token"
