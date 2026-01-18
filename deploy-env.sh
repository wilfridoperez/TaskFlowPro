#!/bin/bash
az webapp config appsettings set \
  --name TaskFlowPro \
  --resource-group TaskFlowPro \
  --settings \
  DATABASE_URL='postgresql://xptxlmkire:Venezuela12!@taskflowpro-server.postgres.database.azure.com:5432/postgres' \
  NEXTAUTH_SECRET='bkp5mtx6seX0x1J6KrMUT2Aicdh9rz1+MWCMGVDTUiA=' \
  NEXTAUTH_URL='https://taskflowpro.azurewebsites.net' \
  NODE_ENV='production' \
  STRIPE_PUBLIC_KEY='pk_test_placeholder' \
  STRIPE_SECRET_KEY='sk_test_placeholder' \
  STRIPE_WEBHOOK_SECRET='whsec_placeholder'
