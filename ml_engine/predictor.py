def recommend_study_time(subject, difficulty):

    if difficulty == "High":
        return "3 Hours"

    elif difficulty == "Medium":
        return "2 Hours"

    else:
        return "1 Hour"


print(recommend_study_time("DBMS","High"))