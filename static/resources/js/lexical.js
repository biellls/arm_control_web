var row = 1;
var col = 1;

function resetLexer() {
    row = 1;
    col = 1;
}

function make_token(token, value) {
    return {
        'token': token,
        'value': value,
        'row': row,
        'col': col
    }
}

function add_keyword_rule(keyword) {
    lexer.addRule(new RegExp(keyword), function(lexeme) {
        return make_token('KW_'+ keyword, lexeme);
    });
}

function add_reserved_word_rule(rw) {
    lexer.addRule(new RegExp(rw), function(lexeme) {
        return make_token('RW_'+ rw, lexeme);
    });
}

var lexer = new Lexer(function (char) {
    throw new Error("Unexpected character at row " + row + ", col " + col + ": " + char);
});

// Handle line jump
lexer.addRule(/\n/, function () {
    row++;
    col = 1;
    return make_token("EOL", '\n');
});
// Skip spaces
lexer.addRule(/\s+/, function () { col++; });

// Add keywords
add_keyword_rule('WHILE');
add_keyword_rule('IF');
add_keyword_rule('THEN');

// Add reserved words and statements
add_reserved_word_rule('TRUE');
add_reserved_word_rule('FALSE');
add_reserved_word_rule('END');

// Numbers
lexer.addRule(/[0-9]+(?:\.[0-9]+)?\b/, function (lexeme) {
    return make_token('NUMBER', lexeme);
});

lexer.addRule(/[a-f\d]+/i, function (lexeme) {
    return make_token('HEX', lexeme);
});

// Identifiers
lexer.addRule(/[a-z]+/, function (lexeme) {
    return make_token('ID', lexeme);
});

// Error: Unexpected character
lexer.addRule(/./, function () {
    this.reject = true;
    col++;
}, []);


// var tokens = lexer.lex();
