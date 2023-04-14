import { ErrorSeverity, ErrorType, SourceError } from '../types';
export declare abstract class InvalidFilePathError implements SourceError {
    filePath: string;
    type: ErrorType;
    severity: ErrorSeverity;
    location: import("estree").SourceLocation;
    constructor(filePath: string);
    abstract explain(): string;
    abstract elaborate(): string;
}
export declare class IllegalCharInFilePathError extends InvalidFilePathError {
    explain(): string;
    elaborate(): string;
}
export declare class ConsecutiveSlashesInFilePathError extends InvalidFilePathError {
    explain(): string;
    elaborate(): string;
}
export declare class CannotFindModuleError implements SourceError {
    moduleFilePath: string;
    type: ErrorType;
    severity: ErrorSeverity;
    location: import("estree").SourceLocation;
    constructor(moduleFilePath: string);
    explain(): string;
    elaborate(): string;
}
export declare class CircularImportError implements SourceError {
    filePathsInCycle: string[];
    type: ErrorType;
    severity: ErrorSeverity;
    location: import("estree").SourceLocation;
    constructor(filePathsInCycle: string[]);
    explain(): string;
    elaborate(): string;
}
