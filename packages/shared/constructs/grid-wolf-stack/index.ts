import { GridWolfEnv } from '../../domain';
import { Construct } from 'constructs';
import { StepintoBaseStack, StepintoBaseProps } from 'stepinto-aws-tools/constructs';

export type GridWolfProps = Omit<StepintoBaseProps, 'appName'>;

export class GridWolfStack extends StepintoBaseStack {
  constructor(scope: Construct, id: string, props: GridWolfProps) {
    super(scope, id, { appName: 'grid-wolf', ...props });
  }
}
