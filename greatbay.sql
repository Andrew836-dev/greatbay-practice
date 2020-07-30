drop database if exists greatbay_db;
create database greatbay_db;

use greatbay_db;

create table items (
itemDescription varchar(50) not null,
id int not null auto_increment,
minimumBid int,
primary key (id)
);