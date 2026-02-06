#!/usr/bin/env node
import { createDocCli } from './cli/index.js';

const cli = createDocCli();
cli.parse();
