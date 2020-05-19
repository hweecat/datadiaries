Title: Grid Search Hyperparameter Optimization in Scikit-learn with GridSearchCV
Date: 2020-05-18 07:30 PM
Category: Scikit-learn
Status: published

## Problem

Choose a set of optimal hyperparameters for a machine learning algorithm in scikit-learn by using grid search

## Today I Learnt

When training a machine learning model, model performance is based on the model hyperparameters specified. A hyperparameter is a parameter whose value is used to control the learning process, in contrast to other model parameters which are learned during the learning process.

It is often laborious to define and tune the hyperparameter values manually to obtain the right set of optimal hyperparameters to optimize model performance - imagine having to keep track of the various combinations of values for the model hyperparameters, as well as their corresponding model performance based on some performance metric.

Grid search algorithm is a hyperparameter optimization that involves performing an exhaustive search of a manually-specified subset of the hyperparameter space. The grid search algorithm must be guided by some performance metric, usually by cross-validation on the training set or evaluation on a held-out validation set.

In scikit-learn, grid search algorithm to optimize an estimator can be performed by using GridSearchCV. The grid search algorithm in GridSearchCV exhaustively generates candidates from a grid of parameter values specified with the param_grid parameter. The parameters of the estimator are optimized by cross-validated grid search over the parameter grid with a scoring parameter or strategy, and parameters that result in an optimized validation score (maximised score for accuracy metrics, minimised score for error metrics) are returned as optimal hyperparameters for the estimator.

A code excerpt demonstrating the use of GridSearchCV for k-Nearest Neighbors classifier is as follows:

:::python

    # Set seed value for random k-fold split
    seed_value = 42

    # Set value of k for Cross-Validation
    k_cv = 5

    # Train-test split of dataset (assuming features and labels have been preprocessed)
    X_training, X_validation, y_training, y_validation = \
        train_test_split(features, label, test_size=test_split, random_state=seed_value)

    # set scoring metric
    model_metric = 'accuracy'

    # List Hyperparameters to tune for k-Nearest Neighbors model
    leaf_size = list(range(1,50))
    n_neighbors = list(range(1,30))
    p=[1,2]

    # convert hyperparameters to dictionary
    hyperparameters = dict(leaf_size=leaf_size, n_neighbors=n_neighbors, p=p)

    # initialize k-Nearest Neighbors model
    knn = KNeighborsClassifier(weights = 'uniform')

    # initialize Stratified K-fold for Cross-Valiation Method
    kf = StratifiedKFold(n_splits=k_cv, random_state=seed_value)

    # perform Grid Search Cross-Validation with Stratified K-fold
    # Scoring metric: Accuracy
    clf = GridSearchCV(knn, hyperparameters, n_jobs=-1,
                    scoring=model_metric, cv=kf)
    best_model = clf.fit(X_training, y_training)

    # Best Hyperparameters Value
    print('Best leaf_size:', best_model.best_params_['leaf_size'])
    print('Best p:', best_model.best_params_['p'])
    print('Best n_neighbors:', best_model.best_params_['n_neighbors'])

    # Best score
    print(f'Best score ({model_metric}): {best_model.best_score_:.3f}')


## Referencees

- [Tuning the hyper-parameters of an estimator](https://scikit-learn.org/stable/modules/grid_search.html)
- [sklearn.model_selection.GridSearchCV -- scikit-learn 0.23.0 documentation](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.GridSearchCV.html)