%{
/*==========================================================
Compiler Construction - Phase 1: Lexical Analyzer
Student  : Rana Fahad
Roll No  : xx69  (R = 69)
Name Len : 10    (L = 10)
Language : RFLang

Personalization Summary:
─────────────────────────────────────────────
Identifier  : starts with ‘R’, ends with ‘d’
(first & last letter of “Rana Fahad”
after removing space → R…d)
Numbers     : R=69 is ODD  → exponential (1.5e2)
R=69 not /5  → binary NOT allowed
R=69 is odd  → hex NOT allowed
Strings     : must start with  R”  (first letter R)
Keywords    : 15 total (10 Urdu/Roman-Urdu, 5 with symbols)
==========================================================*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

FILE *tokens_file;
FILE *errors_file;
int   line_num = 1;

void log_token(const char *type, const char *lexeme) {
printf(“Line %d: %-20s -> %s\n”, line_num, type, lexeme);
fprintf(tokens_file, “Line %d: %-20s -> %s\n”, line_num, type, lexeme);
}

void log_error(const char *msg, const char *lexeme) {
printf(“Line %d: ERROR -> %s "%s"\n”, line_num, msg, lexeme);
fprintf(errors_file, “Line %d: ERROR -> %s "%s"\n”, line_num, msg, lexeme);
}
%}

%option noyywrap

/* ── Regex Definitions ───────────────────────────────── */

/* Identifier: R  [a-zA-Z0-9_]*  d */
IDENTIFIER      R[a-zA-Z0-9_]*d

/* Numbers (R=69 odd → exponential required) */
EXP_NUMBER      [0-9]+.[0-9]+([eE][+-]?[0-9]+)
FLOAT           [0-9]+.[0-9]+
INTEGER         [0-9]+

/* Valid string: must open with  R”  and support escape sequences */
STRING          R"(\[nt\"']|[^"\\n])*"

/* Unterminated string: starts R” but hits newline or EOF */
UNTERM_STRING   R"(\[nt\"']|[^"\\n])*

/* Character literal */
CHAR_LIT        '(\[nt\"']|[^'\\n])'

WHITESPACE      [ \t\r]+

%%

/* ── Comments (single-line) ──────────────────────────── */
“/*”([^*]|*+[^*/])**+”/”   { /* block comment – skip */ }
“//”[^\n]*                   { /* line comment  – skip */ }

/* ── Keywords ────────────────────────────────────────── */
/* 10 Urdu / Roman-Urdu */
“rakho”       { log_token(“KEYWORD”,      yytext); }   /* declare/store    */
“dikhao”      { log_token(“KEYWORD”,      yytext); }   /* print/show       */
“wapis”       { log_token(“KEYWORD”,      yytext); }   /* return           */
“jabtak”      { log_token(“KEYWORD”,      yytext); }   /* while            */
“agar”        { log_token(“KEYWORD”,      yytext); }   /* if               */
“warna”       { log_token(“KEYWORD”,      yytext); }   /* else             */
“kaam”        { log_token(“KEYWORD”,      yytext); }   /* function         */
“band”        { log_token(“KEYWORD”,      yytext); }   /* end/close        */
“sahi”        { log_token(“KEYWORD”,      yytext); }   /* true             */
“galat”       { log_token(“KEYWORD”,      yytext); }   /* false            */
/* 5 with symbols */
“print$”      { log_token(“KEYWORD”,      yytext); }   /* print (symbol)   */
“@loop”       { log_token(“KEYWORD”,      yytext); }   /* loop marker      */
“go#next”     { log_token(“KEYWORD”,      yytext); }   /* continue         */
“stop!”       { log_token(“KEYWORD”,      yytext); }   /* break/halt       */
“run%”        { log_token(“KEYWORD”,      yytext); }   /* execute          */

/* ── Operators (order: longest first) ───────────────── */
“**>”         { log_token(“OPERATOR”,     yytext); }   /* custom: power-fwd */
“%%=”         { log_token(“OPERATOR”,     yytext); }   /* custom: mod-assign*/
“<<”          { log_token(“OPERATOR”,     yytext); }   /* custom: left-shift*/
“==”          { log_token(“OPERATOR”,     yytext); }
“!=”          { log_token(“OPERATOR”,     yytext); }
“<=”          { log_token(“OPERATOR”,     yytext); }
“>=”          { log_token(“OPERATOR”,     yytext); }
“++”          { log_token(“OPERATOR”,     yytext); }
“–”          { log_token(“OPERATOR”,     yytext); }
“+”           { log_token(“OPERATOR”,     yytext); }
“-”           { log_token(“OPERATOR”,     yytext); }
“*”           { log_token(“OPERATOR”,     yytext); }
“/”           { log_token(“OPERATOR”,     yytext); }
“%”           { log_token(“OPERATOR”,     yytext); }
“=”           { log_token(“OPERATOR”,     yytext); }
“<”           { log_token(“OPERATOR”,     yytext); }
“>”           { log_token(“OPERATOR”,     yytext); }
“!”           { log_token(“OPERATOR”,     yytext); }
“&”           { log_token(“OPERATOR”,     yytext); }
“|”           { log_token(“OPERATOR”,     yytext); }

/* ── Punctuation ─────────────────────────────────────── */
“;”           { log_token(“PUNCTUATION”,  yytext); }
“,”           { log_token(“PUNCTUATION”,  yytext); }
“(”           { log_token(“PUNCTUATION”,  yytext); }
“)”           { log_token(“PUNCTUATION”,  yytext); }
“{”           { log_token(“PUNCTUATION”,  yytext); }
“}”           { log_token(“PUNCTUATION”,  yytext); }
“[”           { log_token(“PUNCTUATION”,  yytext); }
“]”           { log_token(“PUNCTUATION”,  yytext); }
“:”           { log_token(“PUNCTUATION”,  yytext); }

/* ── Numbers ─────────────────────────────────────────── */
{EXP_NUMBER}  { log_token(“EXP_NUMBER”,   yytext); }
{FLOAT}       { log_token(“FLOAT”,        yytext); }
{INTEGER}     { log_token(“INTEGER”,      yytext); }

/* Invalid: hex (R is odd → not allowed) */
0[xX][0-9a-fA-F]+  {
log_error(“Invalid Number - hex not allowed (R=69 is odd)”, yytext);
}

/* Invalid: binary (R not divisible by 5 → not allowed) */
0[bB][01]+  {
log_error(“Invalid Number - binary not allowed (R=69 not div by 5)”, yytext);
}

/* ── Strings ─────────────────────────────────────────── */
{STRING}      { log_token(“STRING”,       yytext); }

{UNTERM_STRING}  {
log_error(“Unterminated String”, yytext);
}

/* String not starting with R → invalid */
"[^"]*"    { log_error(“Invalid String - must start with R"”, yytext); }

/* ── Character Literal ───────────────────────────────── */
{CHAR_LIT}    { log_token(“CHAR_LITERAL”, yytext); }

/* ── Identifiers ─────────────────────────────────────── */
{IDENTIFIER}  { log_token(“IDENTIFIER”,   yytext); }

/* Catch-all for bad identifiers: starts with letter/underscore but fails pattern */
[a-zA-Z_][a-zA-Z0-9_]*  {
log_error(“Invalid Identifier - must start with R and end with d”, yytext);
}

/* ── Whitespace & Newlines ───────────────────────────── */
{WHITESPACE}  { /* skip */ }
\n            { line_num++; }

/* ── Unknown symbols ─────────────────────────────────── */
.             { log_error(“Unknown Symbol”, yytext); }

%%

int main(int argc, char *argv[]) {
tokens_file = fopen(“tokens.txt”, “w”);
errors_file = fopen(“errors.txt”, “w”);

```
if (!tokens_file || !errors_file) {
    fprintf(stderr, "Error: could not open output files.\n");
    return 1;
}

fprintf(tokens_file, "=== TOKEN OUTPUT - RFLang Scanner ===\n");
fprintf(tokens_file, "Student: Rana Fahad | R=69 | L=10\n");
fprintf(tokens_file, "=====================================\n\n");

fprintf(errors_file, "=== ERROR OUTPUT - RFLang Scanner ===\n");
fprintf(errors_file, "Student: Rana Fahad | R=69 | L=10\n");
fprintf(errors_file, "=====================================\n\n");

if (argc > 1) {
    FILE *input = fopen(argv[1], "r");
    if (!input) {
        fprintf(stderr, "Error: cannot open input file: %s\n", argv[1]);
        return 1;
    }
    yyin = input;
}

yylex();

fclose(tokens_file);
fclose(errors_file);

printf("\n[Done] Tokens -> tokens.txt  |  Errors -> errors.txt\n");
return 0;
```

}