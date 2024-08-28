# AWS Well-Architected Framework

The Well-Architected Framework is intended to help with understanding the pros and cons of
decisions made while building systems in the AWS cloud. The framework consists of six pillars around
which to have discussion about architectural decisions, measure architectures against best practices
and identify areas for improvement. The six pillars are:

- [AWS Well-Architected Framework Overview](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html)
- [Operational Excellence Pillar](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/welcome.html)
    - Design for telemetry:
        - Identify key performance indicators
        - Implement application telemetry
        - Implement user experience telemetry
        - Implement dependency telemetry
        - Implement distributed tracing
    - [Design for operations](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/design-for-operations.html)
        - Use version control
        - Test and validate changes
        - Use configuration management systems
        - Use build and deployment management systems
        - Perform patch management
        - Share design standards
        - Implement practices to improve code quality
        - Use multiple environments
        - Make frequent, small, reversible changes
        - Fully automate integration and deployment
    - [Mitigate deployment risks](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/mitigate-deployment-risks.html)
        - Plan for unsuccessful changes
        - Test deployments
        - Employ safe deployment strategies
        - Automate testing and rollback
    - [Operational readiness and change management](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/operational-readiness.html)
        - Ensure personnel capability
        - Ensure a consistent review of operational readiness
        - Use runbooks for procedures
        - Use playbooks for troubleshooting
        - Make informed decisions to deploy systems and changes
        - Create support plans
- [Security Pillar](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html)
- [Reliability Pillar](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html)
- [Performance Efficiency Pillar](https://docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar/welcome.html)
- [Cost Optimization Pillar](https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html)
- [Sustainability Pillar](https://docs.aws.amazon.com/wellarchitected/latest/sustainability-pillar/sustainability-pillar.html)

Each pillar includes a set of foundational questions to help with understanding how specific
architectures align well with cloud best practices.  The framework provides a consistent way to
evaluate systems and remediate design issues to optimize cloud applications.

Additionally, AWS provides a cloud-based service for reviewing workloads as well as a number of
labs to promote better understanding of how the framework is intended to work.
