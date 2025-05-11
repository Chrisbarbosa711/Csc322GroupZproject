# -----------------------------------------------------------------------------------------------------
#REQUIRED PACKAGES: pymysql, cryptography
# -----------------------------------------------------------------------------------------------------

import pymysql
# Creating custom class for specialized connection to project specific database
class Database:
    def __init__(self, host = '192.168.1.200', user='remote_user', password='csc322', database='word_editor', *, cursor_type=pymysql.cursors.DictCursor):
        self.connection = pymysql.connect(
            host=host,
            user=user,
            password=password,
            database=database,
            cursorclass=cursor_type
        )
  
# -----------------------------------------------------------------------------------------------------
# Generic query methods to issue SQL commands. Ex: database_class_name.query('SELECT * FROM users')   
    def query(self, sql, params=None):
        """Generic query method"""
        with self.connection.cursor() as cursor:
            cursor.execute(sql, params or ())
            return cursor.fetchall()

    def execute(self, sql, params=None):
        """Executes a query that modifies data (INSERT, UPDATE, DELETE)"""
        with self.connection.cursor() as cursor:
            cursor.execute(sql, params or ())
        self.connection.commit()
# -----------------------------------------------------------------------------------------------------  
# -----------------------------------------------------------------------------------------------------
# Defined queries for users database table
# -----------------------------------------------------------------------------------------------------
# -----------------------------------------------------------------------------------------------------
# Check if username is already in database, returns 'True' or 'False'
    def username_exists(self, existing_user):
        sql = f'''
            SELECT 
                CASE 
                    WHEN EXISTS (SELECT 1 FROM users WHERE username = '{existing_user}') THEN 1
                    ELSE 0
                END AS username_exists;
        '''
        with self.connection.cursor() as cursor:
            cursor.execute(sql)
            return bool(cursor.fetchone()['username_exists'])
# -----------------------------------------------------------------------------------------------------
# Check if password is correct for a specific username, returns 'True' or 'False'
    def check_password(self, username, password):
        sql = f'''
            SELECT 
                CASE 
                    WHEN EXISTS (SELECT 1 FROM users WHERE username = '{username}' AND password = '{password}') THEN 1
                    ELSE 0
                END AS password_valid;
        '''
        with self.connection.cursor() as cursor:
            cursor.execute(sql)
            return bool(cursor.fetchone()['password_valid'])
# -----------------------------------------------------------------------------------------------------
# Check a user's number of tokens, returns an int
    def get_tokens(self, username):
        sql = f'''
            select tokens
            from users
            where username = '{username}'
        '''
        with self.connection.cursor() as cursor:
            cursor.execute(sql)
            return cursor.fetchone()['tokens']
# -----------------------------------------------------------------------------------------------------
# Check a user's type, returns string 'free', 'paid', or 'super'
    def get_user_type(self, username):
        sql = f'''
            select user_type
            from users
            where username = '{username}'
        '''
        with self.connection.cursor() as cursor:
            cursor.execute(sql)
            return cursor.fetchone()['user_type']
# -----------------------------------------------------------------------------------------------------
# Add a new user to the users database. Checks if username already exists. Intializes with user_type 'free' and tokens '0'
    def register_user(self, username, password):
        # Check if username exists
        if self.username_exists(username):
            return False  # Username already exists
        else:
        # Insert new user
            sql = f"INSERT INTO users (username, password, user_type, tokens) VALUES ('{username}', '{password}', 'free', 0)"
            with self.connection.cursor() as cursor:
                cursor.execute(sql)
            self.connection.commit()
            return True
# -----------------------------------------------------------------------------------------------------
# Delete a user from the database. Returns False if they do not exist. 
    def delete_user(self, username):
        if self.username_exists(username):
            sql = f"DELETE FROM users WHERE username = '{username}'"
            with self.connection.cursor() as cursor:
                cursor.execute(sql)
            self.connection.commit()
            return True
        else:
            return False
# -----------------------------------------------------------------------------------------------------
# Change a user's user_type
    def alter_user_type(self, username, type):
        sql = f'''
        update users
        set user_type = '{type}'
        where username = '{username}'
        '''
        with self.connection.cursor() as cursor:
            cursor.execute(sql)
        self.connection.commit()
        return True
# -----------------------------------------------------------------------------------------------------
# Add or subtract tokens of a user. Subtracting more than a user has will set their value to zero
    def alter_tokens(self, username, tokens):
        sql = f'''
        update users
        set tokens = greatest(0 , tokens + {tokens})
        where username = '{username}'
        '''
        with self.connection.cursor() as cursor:
            cursor.execute(sql)
        self.connection.commit()
        return True
# -----------------------------------------------------------------------------------------------------
# Function close connection when finished with queries

    def close(self):
        """Close the database connection"""
        self.connection.close()

# -----------------------------------------------------------------------------------------------------
# -----------------------------------------------------------------------------------------------------
# Defined queries for blacklist table
# -----------------------------------------------------------------------------------------------------
# -----------------------------------------------------------------------------------------------------
# Check if word already in blacklist table, returns 'True' or 'False'
    def blacklist_word_exists(self, word):
        sql = f'''
            SELECT 
                CASE 
                    WHEN EXISTS (SELECT 1 FROM blacklist WHERE word = '{word}') THEN 1
                    ELSE 0
                END AS blacklist_word_exists;
        '''
        with self.connection.cursor() as cursor:
            cursor.execute(sql)
            return bool(cursor.fetchone()['blacklist_word_exists'])

# -----------------------------------------------------------------------------------------------------
# Add a blacklist word to the table. First checks if it already exists. Intializes super_user_reviewed to '0' (False)
    def add_blacklist_word(self, word):
        # Check if blacklisted word already exists
        if self.blacklist_word_exists(word):
            return False  # Word already exists in table
        else:
        # Add new word to blacklist table
            sql = f"INSERT INTO blacklist (word, super_user_reviewed) VALUES ('{word}', 0)"
            with self.connection.cursor() as cursor:
                cursor.execute(sql)
            self.connection.commit()
            return True
# -----------------------------------------------------------------------------------------------------
# Delete a word from the blacklist. Returns False if the word does not exist. 
    def delete_blacklist_word(self, word):
        if self.blacklist_word_exists(word):
            sql = f"DELETE FROM blacklist WHERE word = '{word}'"
            with self.connection.cursor() as cursor:
                cursor.execute(sql)
            self.connection.commit()
            return True
        else:
            return False
# -----------------------------------------------------------------------------------------------------
# Check for unreviewed blacklist words for super user. Return all rows of data.
    def get_unreviewed_blacklist_words(self):
        sql = f'''
            SELECT *
            FROM blacklist
            WHERE super_user_reviewed = 0
        '''
        with self.connection.cursor() as cursor:
            cursor.execute(sql)
            return cursor.fetchall()
# -----------------------------------------------------------------------------------------------------
# Alter super user reviewed value (0 = not reviewed, 1 = reviewed and approved)
    def blacklist_alter_reviewed(self, word, reviewed):
        sql = f'''
        update blacklist
        set super_user_reviewed = {reviewed}
        where word = '{word}'
        '''
        with self.connection.cursor() as cursor:
            cursor.execute(sql)
        self.connection.commit()
        return True

# -----------------------------------------------------------------------------------------------------
# -----------------------------------------------------------------------------------------------------
# Defined queries for complaints table
# -----------------------------------------------------------------------------------------------------
# -----------------------------------------------------------------------------------------------------
# Add a user complaint to the table. Checks if the reporter and reportee exists. Intializes dispute as blank, and super_user_reviewed to '0' (False)
    def add_complaint(self, reporter, reportee, complaint):
        if self.username_exists(reporter):
            if self.username_exists(reportee):
                sql = f"INSERT INTO complaints (reporter, reportee, complaint, dispute, super_user_reviewed) VALUES ('{reporter}', '{reportee}', '{complaint}', NULL, 0)"
                with self.connection.cursor() as cursor:
                    cursor.execute(sql)
                self.connection.commit()
                return True
            else:
                return False
        else:
            return False
# -----------------------------------------------------------------------------------------------------
# Check if complaint exists with id number.
    def complaint_exists(self, id):
        sql = f'''
            SELECT 
                CASE 
                    WHEN EXISTS (SELECT 1 FROM complaints WHERE id = '{id}') THEN 1
                    ELSE 0
                END AS complaint_exists;
        '''
        with self.connection.cursor() as cursor:
            cursor.execute(sql)
            return bool(cursor.fetchone()['complaint_exists'])
# -----------------------------------------------------------------------------------------------------
# Check for undisputed complaints against user. Return all rows of data.
    def get_undisputed_complaints(self, username):
        sql = f'''
            SELECT *
            FROM complaints
            WHERE reportee = '{username}' and dispute is null
        '''
        with self.connection.cursor() as cursor:
            cursor.execute(sql)
            return cursor.fetchall()
# -----------------------------------------------------------------------------------------------------
# Check for unreviewed complaints for super user. Return all rows of data.
    def get_unreviewed_complaints(self):
        sql = f'''
            SELECT *
            FROM complaints
            WHERE super_user_reviewed = 0
        '''
        with self.connection.cursor() as cursor:
            cursor.execute(sql)
            return cursor.fetchall()
# -----------------------------------------------------------------------------------------------------
# add dispute to row with null dispute based on reportee and row id
    def alter_dispute(self, id, username, dispute):
        sql = f'''
            update complaints
            set dispute = '{dispute}'
            where id = {id} and reportee = '{username}'
            '''
        with self.connection.cursor() as cursor:
            cursor.execute(sql)
        self.connection.commit()
        return True
# -----------------------------------------------------------------------------------------------------
# Alter super user reviewed value (0 = not reviewed, 1 = reviewed and approved)
    def complaints_alter_reviewed(self, id, reviewed):
        sql = f'''
        update complaints
        set super_user_reviewed = {reviewed}
        where id = {id}
        '''
        with self.connection.cursor() as cursor:
            cursor.execute(sql)
        self.connection.commit()
        return True
# -----------------------------------------------------------------------------------------------------
# # Delete complaint using id number. Checks if complaint exists first.
    def delete_complaint(self, id):
        if self.complaint_exists(id):
            sql = f"DELETE FROM complaints WHERE id = {id}"
            with self.connection.cursor() as cursor:
                cursor.execute(sql)
            self.connection.commit()
            return True
        else:
            return False
# -----------------------------------------------------------------------------------------------------  
# -----------------------------------------------------------------------------------------------------
# Defined queries for users rejected corrections table
# -----------------------------------------------------------------------------------------------------
# -----------------------------------------------------------------------------------------------------
# Check if correction exists with id number.
    def check_correction_exists(self, id):
        sql = f'''
            SELECT 
                CASE 
                    WHEN EXISTS (SELECT 1 FROM rejected_corrections WHERE id = '{id}') THEN 1
                    ELSE 0
                END AS rejected_corrections;
        '''
        with self.connection.cursor() as cursor:
            cursor.execute(sql)
            return bool(cursor.fetchone()['rejected_corrections'])
# -----------------------------------------------------------------------------------------------------
# Add a correction to the table. Intializes super_user_reviewed to '0' (False)
    def add_correction(self, username, correction, reason):
        sql = f"INSERT INTO rejected_corrections (username, correction, reason, super_user_reviewed) VALUES ('{username}', '{correction}', '{reason}', 0)"
        with self.connection.cursor() as cursor:
            cursor.execute(sql)
        self.connection.commit()
        return True
# -----------------------------------------------------------------------------------------------------
# Alter super user reviewed value of correction, located with id number (0 = not reviewed, 1 = reviewed)
    def corrections_alter_reviewed(self, id, reviewed):
        if self.check_correction_exists(id):
            sql = f'''
            update rejected_corrections
            set super_user_reviewed = {reviewed}
            where id = {id}
            '''
            with self.connection.cursor() as cursor:
                cursor.execute(sql)
            self.connection.commit()
            return True
        else:
            return False
# -----------------------------------------------------------------------------------------------------
# Check for unreviewed rejected corrections for super user. Return all rows of data.
    def get_unreviewed_corrections(self):
        sql = f'''
            SELECT *
            FROM rejected_corrections
            WHERE super_user_reviewed = 0
        '''
        with self.connection.cursor() as cursor:
            cursor.execute(sql)
            return cursor.fetchall()
# -----------------------------------------------------------------------------------------------------
# Delete correction using id number. Checks if correction exists first.
    def delete_correction(self, id):
        if self.check_correction_exists(id):
            sql = f"DELETE FROM rejected_corrections WHERE id = {id}"
            with self.connection.cursor() as cursor:
                cursor.execute(sql)
            self.connection.commit()
            return True
        else:
            return False
# -----------------------------------------------------------------------------------------------------
# -----------------------------------------------------------------------------------------------------
# Defined queries for approved_words table
# -----------------------------------------------------------------------------------------------------
# -----------------------------------------------------------------------------------------------------
# Add a word to the approved words table.
    def add_approved_word(self, username, word):
        sql = f"INSERT INTO approved_words (username, word) VALUES ('{username}', '{word}')"
        with self.connection.cursor() as cursor:
            cursor.execute(sql)
            self.connection.commit()
            return True
# -----------------------------------------------------------------------------------------------------
# Get all words approved for a username.  
    def get_user_words(self, username):
        sql = f'''
            SELECT word
            FROM approved_words
            WHERE username = '{username}'
        '''
        with self.connection.cursor() as cursor:
            cursor.execute(sql)
            return cursor.fetchall()
# -----------------------------------------------------------------------------------------------------
# Check if approved word exists with id number.
    def check_approved_word_exists(self, id):
        sql = f'''
            SELECT 
                CASE 
                    WHEN EXISTS (SELECT 1 FROM approved_words WHERE id = {id}) THEN 1
                    ELSE 0
                END AS approved_words;
        '''
        with self.connection.cursor() as cursor:
            cursor.execute(sql)
            return bool(cursor.fetchone()['approved_words'])   
# -----------------------------------------------------------------------------------------------------
# Delete correction using id number. Checks if correction exists first.
    def delete_approved_word(self, id):
        if self.check_approved_word_exists(id):
            sql = f"DELETE FROM approved_words WHERE id = {id}"
            with self.connection.cursor() as cursor:
                cursor.execute(sql)
            self.connection.commit()
            return True
        else:
            return False


