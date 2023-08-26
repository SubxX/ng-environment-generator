#! /usr/bin/env node

import { program } from 'commander'
import GenerateCommand from './comands/generate';


program
  .name('ng-env')
  .description('A simple package to generate new angular environment')
  .version("1.0.0")
  .usage("[command] [options]")
  .configureHelp({
    sortSubcommands: true,
    subcommandTerm: (cmd) => cmd.name()
  });

// Adding commands here
program.addCommand(GenerateCommand)

program.showHelpAfterError('add --help for additional information)');
program.parse()